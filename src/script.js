import './style.css'
import * as THREE from 'three'

import starsVertexShader from './shaders/stars/vertex.glsl'
import starsFragmentShader from './shaders/stars/fragment.glsl'

import backgroundVertexShader from './shaders/background/vertex.glsl'
import backgroundFragmentShader from './shaders/background/fragment.glsl'

import shootingStarVertexShader from './shaders/shootingStar/vertex.glsl'
import shootingStarFragmentShader from './shaders/shootingStar/fragment.glsl'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 1
camera.lookAt(0, 0, 0)
scene.add(camera)

// Cursor
const cursor = {
    x: 0,
    y: 0
}

window.addEventListener('mousemove', (event) =>
{
    cursor.x = (event.clientX / sizes.width - 0.5) * 0.15
    cursor.y = - (event.clientY / sizes.height - 0.5) * 0.15
})

/**
 * Particles
 */
const starsParameters = {}
starsParameters.count = 200
starsParameters.size = 100
starsParameters.color = new THREE.Color(0.1, 0.1, 0.125)

let starsGeometry = null
let starsMaterial = null
let stars = null

const generateStars = () =>
{
    // Destroy old stars
    if(stars !== null)
    {
        starsGeometry.dispose()
        starsMaterial.dispose()
        scene.remove(stars)
    }

    // Geometry
    starsGeometry = new THREE.BufferGeometry()

    const positions = new Float32Array(starsParameters.count * 3)
    const colors = new Float32Array(starsParameters.count * 3)
    const scales = new Float32Array(starsParameters.count * 1)

    for(let i = 0; i < starsParameters.count; i++)
    {
        const i3 = i * 3

        positions[i3    ] = (Math.random() - 0.5) * 3
        positions[i3 + 1] = (Math.random() - 0.5) * 3
        positions[i3 + 2] = (Math.random() - 0.5) * 3

        colors[i3    ] = starsParameters.color.r
        colors[i3 + 1] = starsParameters.color.g
        colors[i3 + 2] = starsParameters.color.b

        scales[i] = Math.random()
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    starsGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

    // Material
    starsMaterial = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,

        uniforms:
        {
            uSize: { value: starsParameters.size * renderer.getPixelRatio() },
            uTime: { value: 0 }
        },

        vertexShader: starsVertexShader,
        fragmentShader: starsFragmentShader
    })

    // Stars
    stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)
}

/**
 * Background
 */
const backgroundGeometry = new THREE.PlaneGeometry(5, 5, 1, 1)
const backgroundMaterial = new THREE.ShaderMaterial({
    depthWrite: false,

    vertexShader: backgroundVertexShader,
    fragmentShader: backgroundFragmentShader
})
const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial)
scene.add(background)

/**
 * Shooting star
 */
const shootingStarParameters = {}
shootingStarParameters.count = 100
shootingStarParameters.size = 50
shootingStarParameters.color = new THREE.Color(0.1, 0.1, 0.125)

let shootingStarGeometry = null
let shootingStarMaterial = null
let shootingStar = null
let shootingStars = []

const generateShootingStar = (x, y) => {
    // Geometry
    shootingStarGeometry = new THREE.BufferGeometry()

    const positions = new Float32Array(shootingStarParameters.count * 3)
    const colors = new Float32Array(shootingStarParameters.count * 3)
    const scales = new Float32Array(shootingStarParameters.count * 1)

    for(let i = 0; i < shootingStarParameters.count; i++)
    {
        const i3 = i * 3

        positions[i3    ] = (Math.random() - 0.5) * 0.01
        positions[i3 + 1] = (Math.random() - 0.5) * 0.01
        positions[i3 + 2] = (Math.random() - 0.5) * 0.01

        colors[i3    ] = shootingStarParameters.color.r
        colors[i3 + 1] = shootingStarParameters.color.g
        colors[i3 + 2] = shootingStarParameters.color.b

        scales[i] = Math.random()
    }

    shootingStarGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    shootingStarGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    shootingStarGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

    // Material
    shootingStarMaterial = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,

        uniforms:
        {
            uSize: { value: shootingStarParameters.size * renderer.getPixelRatio() },
            uTime: { value: 0 }
        },

        vertexShader: shootingStarVertexShader,
        fragmentShader: shootingStarFragmentShader
    })

    // Shooting star
    shootingStar = new THREE.Points(shootingStarGeometry, shootingStarMaterial)
    shootingStar.position.set(x, y, 0)
    
    shootingStars.push(shootingStar)
    scene.add(shootingStar)
}

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Generate stars
 */
generateStars()

/**
 * Generate shootingStar
 */
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

window.addEventListener('click', (event) =>
{
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)

    const intersect = raycaster.intersectObject(background)

    generateShootingStar(intersect[0].point.x, intersect[0].point.y)
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    // Update camera
    const target = new THREE.Vector3(cursor.x, cursor.y, camera.position.z)
    camera.lookAt(0, 0, 0)
    camera.position.lerp(target, 0.05)

    // Update stars
    starsMaterial.uniforms.uTime.value = elapsedTime

    // Update shootingStar
    if(shootingStars.length)
    {
        for (let i = 0; i < shootingStars.length; i++) {
            shootingStars[i].material.uniforms.uTime.value += deltaTime
            shootingStars[i].position.x += 0.04
            shootingStars[i].position.y += 0.04
        }
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()