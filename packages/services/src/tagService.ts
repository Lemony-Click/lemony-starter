import { prisma } from "@workspace/db";

export interface CreateTagInput {
	name: string;
	color?: string;
}

export const tagService = {
	async list() {
		return prisma.tag.findMany({
			orderBy: { name: "asc" },
			include: { _count: { select: { notes: true } } },
		});
	},

	async create(input: CreateTagInput) {
		return prisma.tag.create({ data: input });
	},

	async delete(id: string) {
		return prisma.tag.delete({ where: { id } });
	},
};
