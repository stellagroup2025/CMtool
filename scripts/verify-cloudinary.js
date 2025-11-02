// Script to verify Cloudinary configuration
// Run with: node scripts/verify-cloudinary.js

require('dotenv').config({ path: '.env.local' })

console.log('\n🔍 Verificando configuración de Cloudinary...\n')

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

console.log('CLOUDINARY_CLOUD_NAME:', cloudName ? '✅ Configurado' : '❌ NO encontrado')
console.log('CLOUDINARY_API_KEY:', apiKey ? '✅ Configurado' : '❌ NO encontrado')
console.log('CLOUDINARY_API_SECRET:', apiSecret ? '✅ Configurado' : '❌ NO encontrado')

if (cloudName && apiKey && apiSecret) {
  console.log('\n✅ Todas las credenciales están configuradas correctamente!')
  console.log('\nValores (parciales):')
  console.log(`  Cloud Name: ${cloudName}`)
  console.log(`  API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`)
  console.log(`  API Secret: ${apiSecret.substring(0, 4)}...***`)
} else {
  console.log('\n❌ Faltan credenciales de Cloudinary!')
  console.log('\n📝 Asegúrate de agregar estas variables en .env.local:')
  console.log('\nCLOUDINARY_CLOUD_NAME=dd4rp7toz')
  console.log('CLOUDINARY_API_KEY=855934749655115')
  console.log('CLOUDINARY_API_SECRET=z3wYtuCcHNi2TWZ1iCWh8wJ5BRs')
  console.log('\nLuego reinicia el servidor: npm run dev')
}

console.log('')
