import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
};

export default SignUpPage;

