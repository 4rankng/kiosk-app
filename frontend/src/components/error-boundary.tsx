import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertCircle, RefreshCw01 } from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
}

/**
 * Last-resort React error boundary. TanStack Router's `errorComponent` handles
 * route-level errors; this catches runtime render crashes inside rendered
 * components so a single throwing component doesn't blank the whole app.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Unhandled render error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center'>
          <AlertCircle className='size-12 text-error-primary' strokeWidth={1.5} />
          <div className='space-y-1'>
            <p className='text-md font-semibold text-primary'>Ứng dụng gặp lỗi</p>
            <p className='text-sm text-tertiary'>
              Đã có lỗi bất ngờ xảy ra. Vui lòng tải lại trang.
            </p>
          </div>
          <Button
            color='primary'
            iconLeading={RefreshCw01}
            onPress={() => window.location.reload()}
          >
            Tải lại trang
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
