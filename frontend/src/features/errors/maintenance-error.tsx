import { Button } from '@/components/base/buttons/button'
import { ErrorPage } from './error-page'

export function MaintenanceError() {
  return (
    <ErrorPage
      code='503'
      title='Hệ thống đang bảo trì!'
      description={
        <>
          Trang web tạm thời không khả dụng. <br />
          Chúng tôi sẽ sớm hoạt động trở lại.
        </>
      }
      actions={
        <Button color='secondary'>Tìm hiểu thêm</Button>
      }
    />
  )
}
