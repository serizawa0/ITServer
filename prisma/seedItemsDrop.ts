import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient()

const main = async () => {
    await prisma.item.deleteMany()
}

main().then(data => {
    console.log('Table Items vidée avec succès')
})