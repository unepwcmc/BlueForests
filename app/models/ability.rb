class Ability
  include CanCan::Ability

  def initialize(user)
    @user = user || User.new # guest user (not logged in)
    @user.roles.each { |role| send(role.name) }

    if @user.roles.size == 0
      can :read, Validation
    end
  end

  def super_admin
    can :manage, Area
    can :manage, Validation
    can :manage, User
  end

  def project_manager
    can :manage, Area
    can :manage, Validation, user_id: @user.id
    can :manage, User, country_id: @user.country_id
  end

  def project_participant
    can :read, Area
    can :manage, Validation, user_id: @user.id
    can [:show, :update, :destroy], User, id: @user.id
  end
end
