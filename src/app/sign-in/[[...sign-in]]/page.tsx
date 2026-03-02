import { SignIn } from '@clerk/nextjs'

const SignInPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 ">
      <SignIn routing="path" path="/sign-in" />
    </div>
  )
}

export default SignInPage
