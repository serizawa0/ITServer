import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient()

const main = async () => {
    await prisma.file.deleteMany()
}

main().then(data => {
    console.log('Table Files vidée avec succès')
})