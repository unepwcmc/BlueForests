role_admin = Role.create(name: 'admin')
role_project_manager = Role.create(name: 'project_manager')
role_project_participant = Role.create(name: 'project_participant')

admin = Admin.create(email: 'decio.ferreira@unep-wcmc.org', password: 'decioferreira', password_confirmation: 'decioferreira', role_ids: [role_admin.id])

Role.update(1, description:'Can edit users, edit validations and create field sites')
Role.update(2, description:'Can edit Validations and create field sites')
Role.update(3, description:'Can make validations via the web or mobile tool')
