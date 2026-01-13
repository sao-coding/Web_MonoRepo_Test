import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ALGORITHM = 'aes-256-cbc'

async function getMasterKey() {
  if (process.env.ENV_MASTER_KEY) {
    return process.env.ENV_MASTER_KEY
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question('ENV_MASTER_KEY not found. Please enter it manually: ', (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function main() {
  const MASTER_KEY = await getMasterKey()

  if (!MASTER_KEY) {
    console.error('Error: No MASTER_KEY provided.')
    process.exit(1)
  }

  // Derive a 32-byte key from the master key using SHA-256
  const key = crypto.createHash('sha256').update(String(MASTER_KEY)).digest()

  const apps = [
    path.join(__dirname, '../apps/rd_aicity'),
    path.join(__dirname, '../apps/product-spec')
  ]

  const action = process.argv[2]
  const targetEnv = process.argv[3] // 'dev', 'staging', 'prod'

  if (!['encrypt', 'decrypt'].includes(action)) {
    console.error('Usage: node scripts/secrets.js [encrypt|decrypt] [dev|staging|prod]')
    process.exit(1)
  }

  if (action === 'decrypt' && !targetEnv) {
    console.error('Error: Missing target environment for decryption.')
    console.error('Usage: node scripts/secrets.js decrypt [dev|staging|prod]')
    process.exit(1)
  }

  // Define source files for encryption
  const envFiles = {
    dev: '.env.dev',
    staging: '.env.staging',
    prod: '.env.prod'
  }

  // Root directory where source .env files are located (e.g., root of monorepo)
  const rootDir = path.join(__dirname, '..')

  if (action === 'encrypt') {
    // Encrypt all environment files found in root
    Object.entries(envFiles).forEach(([envName, fileName]) => {
      const envPath = path.join(rootDir, fileName)
      const encPath = path.join(rootDir, `${fileName}.enc`)

      if (fs.existsSync(envPath)) {
        try {
          const text = fs.readFileSync(envPath, 'utf8')
          const iv = crypto.randomBytes(16)
          const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
          let encrypted = cipher.update(text, 'utf8', 'hex')
          encrypted += cipher.final('hex')

          const output = iv.toString('hex') + ':' + encrypted
          fs.writeFileSync(encPath, output)
          console.log(`Encrypted: ${fileName} -> ${fileName}.enc`)
        } catch (err) {
          console.error(`Failed to encrypt ${fileName}: ${err.message}`)
        }
      } else {
        console.warn(`Skipping: ${fileName} not found in root.`)
      }
    })
  } else if (action === 'decrypt') {
    const fileName = envFiles[targetEnv]
    const encPath = path.join(rootDir, `${fileName}.enc`)

    if (fs.existsSync(encPath)) {
      try {
        const content = fs.readFileSync(encPath, 'utf8')
        const parts = content.split(':')
        if (parts.length !== 2) {
          console.error(`Error: Invalid format in ${encPath}`)
          process.exit(1)
        }
        const iv = Buffer.from(parts[0], 'hex')
        const encryptedText = parts[1]

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
        decrypted += decipher.final('utf8')

        // Distribute decrypted .env to all apps
        apps.forEach((appPath) => {
          const targetPath = path.join(appPath, '.env')
          fs.writeFileSync(targetPath, decrypted)
          console.log(`Decrypted & Copied: ${fileName}.enc -> ${targetPath}`)
        })
      } catch (err) {
        console.error(`Failed to decrypt ${encPath}: ${err.message}`)
        process.exit(1)
      }
    } else {
      console.error(`Error: Encrypted file ${fileName}.enc not found for environment ${targetEnv}.`)
      process.exit(1)
    }
  }
}

main()
