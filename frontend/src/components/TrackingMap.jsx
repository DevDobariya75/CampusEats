import { useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const PDPU_COORDS = [23.1541, 72.6669]
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '')

const walkingIcon = new L.DivIcon({
  className: 'campus-eats-walker-icon',
  html: `
    <svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="21" cy="21" r="20" fill="#F97316"/>
      <path d="M14 27.5L18.2 19.6L21.9 22.1L19 29.5H16L17.8 24.6L15.3 23L14 27.5Z" fill="#fff"/>
      <circle cx="23.5" cy="12" r="3.5" fill="#fff"/>
      <path d="M20.3 17.3L24 15L28 18.2L26.6 20.1L24 18.1L22.2 19.2L24.1 22.8H27.5V25.1H22.6L20.3 20.6V17.3Z" fill="#fff"/>
    </svg>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
})

const customerIcon = new L.DivIcon({
  className: 'campus-eats-customer-icon',
  html: `
    <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="14" cy="14" r="13" fill="#ffffff" stroke="#F97316" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="#F97316"/>
    </svg>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

const toNumeric = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function RelocateController({ trigger, partnerLocation, destinationLocation }) {
  const map = useMap()

  useEffect(() => {
    if (!trigger) {
      return
    }

    const boundsPoints = [[PDPU_COORDS[0], PDPU_COORDS[1]]]

    if (partnerLocation) {
      boundsPoints.push([partnerLocation.latitude, partnerLocation.longitude])
    }

    if (destinationLocation) {
      boundsPoints.push([destinationLocation.latitude, destinationLocation.longitude])
    }

    map.fitBounds(boundsPoints, {
      padding: [46, 46],
      maxZoom: 17,
      animate: true,
    })
  }, [destinationLocation, map, partnerLocation, trigger])

  return null
}

export default function TrackingMap({ orderId, destination, className = '' }) {
  const [partnerLocation, setPartnerLocation] = useState(null)
  const [customerGpsFallback, setCustomerGpsFallback] = useState(null)
  const [relocateTrigger, setRelocateTrigger] = useState(0)
  const socketRef = useRef(null)

  const destinationLocation = useMemo(() => {
    const latitude = toNumeric(destination?.latitude)
    const longitude = toNumeric(destination?.longitude)

    if (latitude !== null && longitude !== null) {
      return { latitude, longitude }
    }

    return customerGpsFallback
  }, [customerGpsFallback, destination?.latitude, destination?.longitude])

  const isDestinationApproximate = useMemo(() => {
    if (!destinationLocation) {
      return false
    }

    const latitude = toNumeric(destination?.latitude)
    const longitude = toNumeric(destination?.longitude)
    return latitude === null || longitude === null
  }, [destination?.latitude, destination?.longitude, destinationLocation])

  useEffect(() => {
    if (!orderId) {
      return undefined
    }

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('joinOrder', { orderId })
    })

    socket.on('locationUpdate', (payload) => {
      if (payload?.orderId !== orderId) {
        return
      }

      setPartnerLocation({
        latitude: payload.latitude,
        longitude: payload.longitude,
        timestamp: payload.timestamp,
      })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [orderId])

  useEffect(() => {
    const latitude = toNumeric(destination?.latitude)
    const longitude = toNumeric(destination?.longitude)

    if (latitude !== null && longitude !== null) {
      return undefined
    }

    if (!navigator.geolocation) {
      return undefined
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCustomerGpsFallback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => {
        // Best effort fallback only.
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [destination?.latitude, destination?.longitude])

  const handleRelocate = () => {
    setRelocateTrigger((prev) => prev + 1)
  }

  return (
    <div className={`rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-[0_8px_30px_rgba(15,23,42,0.08)] ${className}`}>
      <div className="px-4 py-3 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-white/10 dark:to-white/5 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-orange-500">Walking Delivery Tracking</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Default view stays on PDPU. Use relocate to focus tracking.</p>
          </div>
          <button
            type="button"
            onClick={handleRelocate}
            className="shrink-0 rounded-lg border border-orange-300 bg-orange-500 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-orange-400 active:scale-95 transition-all"
          >
            Relocate
          </button>
        </div>
      </div>

      <MapContainer center={PDPU_COORDS} zoom={15} style={{ height: '340px', width: '100%' }} scrollWheelZoom={false}>
        <RelocateController
          trigger={relocateTrigger}
          partnerLocation={partnerLocation}
          destinationLocation={destinationLocation}
        />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <CircleMarker
          center={[PDPU_COORDS[0], PDPU_COORDS[1]]}
          radius={7}
          pathOptions={{ color: '#1d4ed8', fillColor: '#1d4ed8', fillOpacity: 0.9, weight: 2 }}
        >
          <Popup>PDPU Campus Default Focus</Popup>
        </CircleMarker>

        {destinationLocation && (
          <Marker position={[destinationLocation.latitude, destinationLocation.longitude]} icon={customerIcon}>
            <Popup>
              {isDestinationApproximate ? 'Your current location (approximate)' : 'Delivery destination'}
            </Popup>
          </Marker>
        )}

        {partnerLocation && (
          <Marker position={[partnerLocation.latitude, partnerLocation.longitude]} icon={walkingIcon}>
            <Popup>Delivery partner is walking to you.</Popup>
          </Marker>
        )}

        {partnerLocation && destinationLocation && (
          <>
            <Polyline
              positions={[
                [partnerLocation.latitude, partnerLocation.longitude],
                [destinationLocation.latitude, destinationLocation.longitude],
              ]}
              pathOptions={{
                color: '#fb923c',
                weight: 8,
                opacity: 0.25,
                lineCap: 'round',
              }}
            />
            <Polyline
              positions={[
                [partnerLocation.latitude, partnerLocation.longitude],
                [destinationLocation.latitude, destinationLocation.longitude],
              ]}
              pathOptions={{
                color: '#f97316',
                weight: 4,
                opacity: 0.95,
                dashArray: '2 9',
                lineCap: 'round',
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  )
}
