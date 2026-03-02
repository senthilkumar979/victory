import { TaskResetPassword } from '@clerk/nextjs'

const ResetPasswordPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 ">
      <TaskResetPassword redirectUrlComplete="/" />
    </div>
  )
}

export default ResetPasswordPage
