import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'

export default function BurgerModel({ progress = 0, ...props }) {
	const { scene } = useGLTF('/animation/Cheeseburger.glb')
	const timelineRef = useRef(null)
	const rootRef = useRef(null)

	const burgerData = useMemo(() => {
		const burgerScene = scene.clone()

		const box = new THREE.Box3().setFromObject(burgerScene)
		const center = new THREE.Vector3()
		const size = new THREE.Vector3()
		box.getCenter(center)
		box.getSize(size)

		const maxDim = Math.max(size.x, size.y, size.z) || 1
		const fitScale = 5.5 / maxDim

		return {
			burgerScene,
			center,
			fitScale,
		}
	}, [scene])

	useLayoutEffect(() => {
		const bunTop = burgerData.burgerScene.getObjectByName('Bun_Top')
		const lettuce = burgerData.burgerScene.getObjectByName('Lettuce')
		const cheese = burgerData.burgerScene.getObjectByName('Cheese')
		const patty = burgerData.burgerScene.getObjectByName('Patty')
		const bunBottom = burgerData.burgerScene.getObjectByName('Bun_Bottom')

		const layers = [bunTop, lettuce, cheese, patty, bunBottom].filter(Boolean)
		if (!layers.length) return undefined

		const initialY = new Map(layers.map((layer) => [layer.uuid, layer.position.y]))
		const tl = gsap.timeline({ paused: true })

		tl.to(
			bunTop?.position,
			{
				y: (initialY.get(bunTop?.uuid) ?? 0) + 0.8,
				duration: 1,
				ease: 'power3.out',
			},
			0
		)
			.to(
				lettuce?.position,
				{
					y: (initialY.get(lettuce?.uuid) ?? 0) + 0.45,
					duration: 1,
					ease: 'power3.out',
				},
				0
			)
			.to(
				cheese?.position,
				{
					y: (initialY.get(cheese?.uuid) ?? 0) + 0.18,
					duration: 1,
					ease: 'power3.out',
				},
				0
			)
			.to(
				patty?.position,
				{
					y: (initialY.get(patty?.uuid) ?? 0) - 0.22,
					duration: 1,
					ease: 'power3.out',
				},
				0
			)
			.to(
				bunBottom?.position,
				{
					y: (initialY.get(bunBottom?.uuid) ?? 0) - 0.72,
					duration: 1,
					ease: 'power3.out',
				},
				0
			)

		timelineRef.current = tl

		return () => {
			tl.kill()
			timelineRef.current = null
		}
	}, [burgerData.burgerScene])

	useFrame(() => {
		if (!timelineRef.current || !rootRef.current) return

		const clamped = Math.max(0, Math.min(1, progress))
		timelineRef.current.progress(clamped)

		const angle = clamped * Math.PI * 2.6
		const targetScale = burgerData.fitScale * (0.9 + clamped * 0.42)
		const targetY = -0.12 + clamped * 0.42 + Math.sin(angle) * 0.14
		const targetX = Math.sin(angle * 0.5) * 0.08
		const targetZ = Math.cos(angle) * 0.18
		const targetRotY = 0.16 + clamped * 0.4
		const targetRotX = 0.08 + Math.sin(angle) * 0.05

		rootRef.current.scale.x += (targetScale - rootRef.current.scale.x) * 0.08
		rootRef.current.scale.y += (targetScale - rootRef.current.scale.y) * 0.08
		rootRef.current.scale.z += (targetScale - rootRef.current.scale.z) * 0.08

		rootRef.current.position.x += (targetX - rootRef.current.position.x) * 0.08
		rootRef.current.position.y += (targetY - rootRef.current.position.y) * 0.08
		rootRef.current.position.z += (targetZ - rootRef.current.position.z) * 0.08

		rootRef.current.rotation.y += (targetRotY - rootRef.current.rotation.y) * 0.08
		rootRef.current.rotation.x += (targetRotX - rootRef.current.rotation.x) * 0.08
	})

	return (
		<group
			ref={rootRef}
			scale={burgerData.fitScale * 0.9}
			position={[0, -0.1, 0]}
			{...props}
		>
			<primitive
				object={burgerData.burgerScene}
				position={[-burgerData.center.x, -burgerData.center.y, -burgerData.center.z]}
			/>
		</group>
	)
}

useGLTF.preload('/animation/Cheeseburger.glb')
