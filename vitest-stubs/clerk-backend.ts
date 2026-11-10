/** Test resolver stub. App tests mock `verifyToken`; production keeps the real package. */
export function verifyToken(): Promise<never> {
  return Promise.reject(new Error('@clerk/backend verifyToken stub must be mocked'))
}
