class TestMailer < ActionMailer::Base
  default from: "no-reply@unep-wcmc.org"

  def welcome_email
    mail(:to => "decio.ferreira@unep-wcmc.org", :subject => "Test mailer")
  end
end
