class Ability
  include CanCan::Ability

  def initialize(admin)
    @admin = admin || Admin.new # guest user (not logged in)
    @admin.roles.each { |role| send(role.name) }

    if @admin.roles.size == 0
      can :read, Validation
    end
  end

  def admin
    can :manage, Area
    can :manage, Validation
    can :manage, Admin
    can :read, Habitat
  end

  def project_manager
    can :read, Area
    can :manage, Validation, admin_id: @admin.id
    can [:show, :update, :destroy], Admin, id: @admin.id
  end

  def project_participant
    can :read, Area
    can :manage, Validation, admin_id: @admin.id
    can [:show, :update, :destroy], Admin, id: @admin.id
  end
end
