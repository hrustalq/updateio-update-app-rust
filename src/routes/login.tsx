import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { QRCodeSVG } from 'qrcode.react'
import { useQuery, useMutation } from '@tanstack/react-query'
import generateQRCode from '@/entities/auth/api/generateQRCode'
import loginWithQRCode from '@/entities/auth/api/loginWithQRCode'
import { QRCodeSession } from '@/entities/auth/login.entity'
import { useAuth } from '@/hooks/use-auth'
import socket from '@/entities/auth/qr-code-socket'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/button'

export const Route = createFileRoute('/login')({
  component: QRCode,
})

function QRCode() {
  const navigate = useNavigate()
  const { checkAuth } = useAuth()
  const [socketConnected, setSocketConnected] = useState(false)

  // Query for generating QR code
  const { 
    data: qrData,
    isLoading: isGenerating,
    error: generateError,
    refetch 
  } = useQuery({
    queryKey: ['qrCode'],
    queryFn: generateQRCode,
    refetchInterval: (data) => {
      if (!data) return false
      const expiresAt = new Date(data.state.data?.expiresAt || '').getTime()
      const now = new Date().getTime()
      if (expiresAt <= now) {
        return 0
      }
      return expiresAt - now
    },
    enabled: socketConnected
  })

  // Mutation for login
  const { mutate: login } = useMutation({
    mutationFn: loginWithQRCode,
    onSuccess: async () => {
      await checkAuth()
      navigate({ to: '/' })
    }
  })

  useEffect(() => {
    if (qrData) {

      if (socketConnected) {
        socket.emit('subscribeToQrCode', qrData.code)
      } else {
        socket.connect()
        socket.emit('subscribeToQrCode', qrData.code)
      }
    }
  }, [qrData])

  useEffect(() => {
    socket.on('connect', () => {
      setSocketConnected(true)
    })
  }, [])

  useEffect(() => {
    socket.on('disconnect', () => {
      setSocketConnected(false)
    })
  }, [])

  useEffect(() => {
    socket.on('qrCodeStatus', (data: QRCodeSession) => {
      if (data.status === 'CONFIRMED') {
        login(data.qrCode)
      }
    })
  }, [socketConnected])

  useEffect(() => {
    if (!socketConnected) {
      socket.connect()
      setSocketConnected(true)
    }
  }, [socketConnected])

  const isLoading = isGenerating

  if (generateError) {
    return (
      <div className="flex flex-col gap-y-4 items-center justify-center overflow-hidden h-screen w-screen absolute top-0 left-0 z-50">
        <p className="text-red-500">Не удалось получить QR код</p>
        <Button 
          onClick={() => refetch()}
          className="block"
        >
          Попробовать снова
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center overflow-hidden h-screen w-screen absolute top-0 left-0 z-50 bg-white dark:bg-gray-900">
      {isLoading || !socketConnected ? (
        <div className="animate-pulse">
          <div className="w-64 h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      ) : qrData ? (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Войдите в аккаунт
          </p>
          <QRCodeSVG 
            value={qrData.code}
            size={256}
            level="H"
            includeMargin
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Отсканируйте этот QR код с помощью приложения в Telegram
          </p>
        </div>
      ) : null}
    </div>
  )
}