class Ability
  include CanCan::Ability

  def initialize(user)
    @user = user || User.new # guest user (not logged in)
    @user.roles.each { |role| send(role.name) }

    if @user.roles.empty?
      can :read, Validation
    end
  end

  def super_admin
    can :manage, Area
    can :manage, Validation
    can :manage, User
    can :read, Role
  end

  def project_manager
    can :manage, Area, country_id: @user.users_countries.map(&:country_id)
    can :manage, Validation, country_id: @user.users_countries.map(&:country_id)
    can :manage, User do |user|
      user.country_ids.empty? || (user.country_ids & @user.country_ids).any?
    end
    can :read, Role, name: ['project_manager', 'project_participant']
  end

  def project_participant
    can :read, Area, country_id: @user.users_countries.map(&:country_id)
    can :manage, Validation, user_id: @user.id
    can [:show, :update, :destroy], User, id: @user.id
    can :read, Role, name: 'project_participant'
  end
end
