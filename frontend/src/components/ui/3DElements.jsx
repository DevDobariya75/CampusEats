/* eslint-disable-next-line no-unused-vars */
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export const FloatingShapes = () => {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    containerRef.current.appendChild(renderer.domElement)

    camera.position.z = 5

    // Create floating objects
    const geometry1 = new THREE.IcosahedronGeometry(1, 4)
    const geometry2 = new THREE.TorusGeometry(1.5, 0.3, 16, 100)
    const geometry3 = new THREE.OctahedronGeometry(1)

    const material1 = new THREE.MeshPhongMaterial({
      color: 0xf97316,
      emissive: 0xf97316,
      wireframe: false,
    })
    const material2 = new THREE.MeshPhongMaterial({
      color: 0x0ea5e9,
      emissive: 0x0ea5e9,
      wireframe: false,
    })
    const material3 = new THREE.MeshPhongMaterial({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      wireframe: false,
    })

    const mesh1 = new THREE.Mesh(geometry1, material1)
    const mesh2 = new THREE.Mesh(geometry2, material2)
    const mesh3 = new THREE.Mesh(geometry3, material3)

    mesh1.position.set(-2, 2, 0)
    mesh2.position.set(2, -1, 0)
    mesh3.position.set(0, 0, -2)

    scene.add(mesh1, mesh2, mesh3)

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1, 100)
    light.position.set(5, 5, 5)
    scene.add(light)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    // Animation
    const animate = () => {
      requestAnimationFrame(animate)

      mesh1.rotation.x += 0.005
      mesh1.rotation.y += 0.01
      mesh2.rotation.x += 0.008
      mesh2.rotation.y += 0.005
      mesh3.rotation.x += 0.01
      mesh3.rotation.y += 0.008

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      const newWidth = containerRef.current?.clientWidth || width
      const newHeight = containerRef.current?.clientHeight || height

      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)

    const container = containerRef.current
    return () => {
      window.removeEventListener('resize', handleResize)
      container?.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}

export const AnimatedGradientBg = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{
          background: [
            'linear-gradient(45deg, rgba(249, 115, 22, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)',
            'linear-gradient(225deg, rgba(139, 92, 246, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)',
            'linear-gradient(45deg, rgba(14, 165, 233, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            'linear-gradient(225deg, rgba(249, 115, 22, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="w-full h-full"
      />
    </div>
  )
}

export const ParticleBackground = () => {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const generateParticles = () => {
      return Array.from({ length: 50 }).map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        nextX: Math.random() * window.innerWidth,
        nextY: Math.random() * window.innerHeight,
        duration: Math.random() * 20 + 20,
      }))
    }
    setParticles(generateParticles())
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          initial={{
            x: particle.x,
            y: particle.y,
          }}
          animate={{
            x: particle.nextX,
            y: particle.nextY,
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="fixed w-1 h-1 bg-orange-400 rounded-full opacity-30"
        />
      ))}
    </div>
  )
}

export const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)' }}
      className={`
        backdrop-blur-xl bg-white/20 dark:bg-slate-900/30 border border-white/30 dark:border-white/10 rounded-3xl 
        shadow-2xl hover:shadow-2xl transition-all duration-300
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export const AnimatedCounter = ({ from = 0, to, duration = 1 }) => {
  const ref = useRef(null)

  useEffect(() => {
    const target = {
      value: from,
    }

    const animate = () => {
      const increment = (to - from) / (duration * 60)
      target.value += increment

      if (target.value >= to) {
        target.value = to
        if (ref.current) ref.current.textContent = Math.floor(to)
        return
      }

      if (ref.current) ref.current.textContent = Math.floor(target.value)
      requestAnimationFrame(animate)
    }

    animate()
  }, [from, to, duration])

  return <span ref={ref}>{from}</span>
}

export const StaggerContainer = ({ children, delay = 0.1 }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export const StaggerItem = ({ children }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}
