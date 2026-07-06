import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

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
          <AlertCircle className='h-12 w-12 text-destructive' strokeWidth={1.5} />
          <div className='space-y-1'>
            <p className='text-lg font-semibold'>Ứng dụng gặp lỗi</p>
            <p className='text-sm text-muted-foreground'>
              Đã có lỗi bất ngờ xảy ra. Vui lòng tải lại trang.
            </p>
          </div>
          <button
            type='button'
            onClick={() => window.location.reload()}
            className='inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
          >
            <RefreshCw className='h-4 w-4' />
            Tải lại trang
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
