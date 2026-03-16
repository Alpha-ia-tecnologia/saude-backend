// Admin Service - User and Permission Management
// Refactored to use Prisma instead of in-memory arrays

import prisma from '../lib/prisma.js';

/**
 * Transform Permission[] rows (with module relation) into the
 * { moduleName: { read, write } } object the frontend expects.
 */
function permissionsToMap(permissions) {
    const map = {};
    for (const p of permissions) {
        map[p.module.nome] = { read: p.read, write: p.write };
    }
    return map;
}

/**
 * Transform a Role row (with permissions+module includes) to the
 * shape the frontend expects (permissions as a map).
 */
function formatRole(role) {
    return {
        id: role.id,
        nome: role.nome,
        descricao: role.descricao,
        cor: role.cor,
        permissions: permissionsToMap(role.permissions)
    };
}

const adminService = {
    async getUsers(filters = {}) {
        const where = {};

        if (filters.roleId) {
            where.roleId = parseInt(filters.roleId);
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.search) {
            const term = filters.search;
            where.OR = [
                { nome: { contains: term, mode: 'insensitive' } },
                { email: { contains: term, mode: 'insensitive' } }
            ];
        }

        const users = await prisma.user.findMany({
            where,
            include: {
                role: {
                    include: {
                        permissions: {
                            include: { module: true }
                        }
                    }
                }
            },
            orderBy: { id: 'asc' }
        });

        return users.map(u => ({
            id: u.id,
            nome: u.nome,
            email: u.email,
            cpf: u.cpf,
            roleId: u.roleId,
            status: u.status,
            ultimoLogin: u.ultimoLogin ? u.ultimoLogin.toISOString() : null,
            criadoEm: u.createdAt.toISOString(),
            role: formatRole(u.role)
        }));
    },

    async getUserById(id) {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: { module: true }
                        }
                    }
                }
            }
        });

        if (!user) return null;

        return {
            id: user.id,
            nome: user.nome,
            email: user.email,
            cpf: user.cpf,
            roleId: user.roleId,
            status: user.status,
            ultimoLogin: user.ultimoLogin ? user.ultimoLogin.toISOString() : null,
            criadoEm: user.createdAt.toISOString(),
            role: formatRole(user.role)
        };
    },

    async createUser(data) {
        const existing = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existing) {
            throw new Error('Email ja cadastrado no sistema');
        }

        const user = await prisma.user.create({
            data: {
                nome: data.nome,
                email: data.email,
                cpf: data.cpf || null,
                roleId: parseInt(data.roleId),
                status: 'ativo'
            },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: { module: true }
                        }
                    }
                }
            }
        });

        return {
            id: user.id,
            nome: user.nome,
            email: user.email,
            cpf: user.cpf,
            roleId: user.roleId,
            status: user.status,
            ultimoLogin: null,
            criadoEm: user.createdAt.toISOString(),
            role: formatRole(user.role)
        };
    },

    async updateUser(id, data) {
        const existing = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existing) {
            throw new Error('Usuario nao encontrado');
        }

        const updateData = {};
        if (data.nome) updateData.nome = data.nome;
        if (data.email) updateData.email = data.email;
        if (data.cpf) updateData.cpf = data.cpf;
        if (data.roleId) updateData.roleId = parseInt(data.roleId);
        if (data.status) updateData.status = data.status;

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                role: {
                    include: {
                        permissions: {
                            include: { module: true }
                        }
                    }
                }
            }
        });

        return {
            id: user.id,
            nome: user.nome,
            email: user.email,
            cpf: user.cpf,
            roleId: user.roleId,
            status: user.status,
            ultimoLogin: user.ultimoLogin ? user.ultimoLogin.toISOString() : null,
            criadoEm: user.createdAt.toISOString(),
            role: formatRole(user.role)
        };
    },

    async deactivateUser(id) {
        const existing = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existing) {
            throw new Error('Usuario nao encontrado');
        }

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { status: 'inativo' },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: { module: true }
                        }
                    }
                }
            }
        });

        return {
            id: user.id,
            nome: user.nome,
            email: user.email,
            cpf: user.cpf,
            roleId: user.roleId,
            status: user.status,
            ultimoLogin: user.ultimoLogin ? user.ultimoLogin.toISOString() : null,
            criadoEm: user.createdAt.toISOString(),
            role: formatRole(user.role)
        };
    },

    async getRoles() {
        const roles = await prisma.role.findMany({
            include: {
                permissions: {
                    include: { module: true }
                }
            },
            orderBy: { id: 'asc' }
        });

        return roles.map(formatRole);
    },

    async getRoleById(id) {
        const role = await prisma.role.findUnique({
            where: { id: parseInt(id) },
            include: {
                permissions: {
                    include: { module: true }
                }
            }
        });

        if (!role) return null;
        return formatRole(role);
    },

    async getPermissions(roleId) {
        const role = await prisma.role.findUnique({
            where: { id: parseInt(roleId) },
            include: {
                permissions: {
                    include: { module: true }
                }
            }
        });

        if (!role) return null;

        return {
            roleId: role.id,
            roleName: role.nome,
            permissions: permissionsToMap(role.permissions)
        };
    },

    async updatePermissions(roleId, permissions) {
        const parsedRoleId = parseInt(roleId);

        const role = await prisma.role.findUnique({
            where: { id: parsedRoleId }
        });

        if (!role) {
            throw new Error('Perfil nao encontrado');
        }

        // Upsert each permission entry inside a transaction
        await prisma.$transaction(async (tx) => {
            for (const [moduleName, perms] of Object.entries(permissions)) {
                // Find or fail the module
                const mod = await tx.module.findUnique({
                    where: { nome: moduleName }
                });
                if (!mod) continue;

                await tx.permission.upsert({
                    where: {
                        roleId_moduleId: {
                            roleId: parsedRoleId,
                            moduleId: mod.id
                        }
                    },
                    update: {
                        read: perms.read,
                        write: perms.write
                    },
                    create: {
                        roleId: parsedRoleId,
                        moduleId: mod.id,
                        read: perms.read,
                        write: perms.write
                    }
                });
            }
        });

        // Return the updated role in the expected format
        const updated = await prisma.role.findUnique({
            where: { id: parsedRoleId },
            include: {
                permissions: {
                    include: { module: true }
                }
            }
        });

        return formatRole(updated);
    },

    async getModules() {
        const modules = await prisma.module.findMany({
            orderBy: { id: 'asc' }
        });
        return modules.map(m => m.nome);
    }
};

export default adminService;
