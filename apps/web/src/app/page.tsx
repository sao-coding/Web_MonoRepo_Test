'use client'

import { useAuth } from '@msi/auth'
import { Button } from '@msi/ui/components/button'
import Link from 'next/link'

const Home = () => {
  const { user, login, logout } = useAuth()
  return (
    <div>
      <h1 className='text-3xl font-bold underline'>Hello world!</h1>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <Button onClick={logout}>Logout</Button>
        </div>
      ) : (
        <Button onClick={() => login({ userName: 'test', password: 'test' })}>Login</Button>
      )}
      <Button>Click Me</Button>
      <Link href='/about'>Go to About Page</Link>
    </div>
  )
}

export default Home
