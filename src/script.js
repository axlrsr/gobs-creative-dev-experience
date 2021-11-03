import './style.css'
import * as THREE from 'three'

import starVertexShader from './shaders/star/vertex.glsl'
import starFragmentShader from './shaders/star/fragment.glsl'

import backgroundVertexShader from './shaders/background/vertex.glsl'
import backgroundFragmentShader from './shaders/background/fragment.glsl'

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
// camera.position.x = 1
// camera.position.y = 1
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
const parameters = {}
parameters.count = 200
parameters.size = 0.01
parameters.color = new THREE.Color(0.1, 0.1, 0.125)

let geometry = null
let material = null
let points = null

const generateStars = () =>
{
    // Destroy old stars
    if(points !== null)
    {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    // Geometry
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)
    const scales = new Float32Array(parameters.count * 1)

    for(let i = 0; i < parameters.count; i++)
    {
        const i3 = i * 3

        positions[i3    ] = (Math.random() - 0.5) * 3
        positions[i3 + 1] = (Math.random() - 0.5) * 3
        positions[i3 + 2] = (Math.random() - 0.5) * 3

        colors[i3    ] = parameters.color.r
        colors[i3 + 1] = parameters.color.g
        colors[i3 + 2] = parameters.color.b

        scales[i] = Math.random()
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

    // Material
    material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,

        uniforms:
        {
            uSize: { value: 100 * renderer.getPixelRatio() },
            uTime: { value: 0 }
        },

        vertexShader: starVertexShader,
        fragmentShader: starFragmentShader
    })

    // Points
    points = new THREE.Points(geometry, material)
    scene.add(points)
}

/**
 * Background
 */
const backgroundGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const backgroundMaterial = new THREE.ShaderMaterial({
    depthWrite: false,

    vertexShader: backgroundVertexShader,
    fragmentShader: backgroundFragmentShader
})
const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial)
scene.add(background)

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
    material.uniforms.uTime.value = elapsedTime

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()