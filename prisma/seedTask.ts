import { PrismaClient } from "../src/generated/prisma"

const prisma = new PrismaClient()

const main = async () => {
    await prisma.task.deleteMany()
    return 
}

main().then(data => {
    console.log('table Task vidée avec succès')
})