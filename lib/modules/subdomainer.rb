module Subdomainer
  def self.country request
    subdomain = request.is_a?(String) ? request : request.subdomain
    Country.find_by_subdomain extract(subdomain)
  end

  def self.root
    Rails.application.secrets.base_subdomain
  end

  def self.root? request
    request.subdomain == root.to_s
  end

  def self.from_user user, country_id=nil
    return from_super_admin if user.super_admin?

    if user.countries.count > 1
      resolve user.countries.find(country_id).try(:subdomain)
    else
      resolve user.countries.first.subdomain
    end
  end

  def self.from_super_admin
    resolve Rails.application.secrets.admin_subdomain
  end

  def self.resolve subdomain
    [subdomain, root].compact.join('.')
  end

  def self.extract subdomain
    first_dot = subdomain.index('.').to_i
    subdomain[0..first_dot-1]
  end
end
