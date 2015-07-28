require 'rails_helper'

# Specs in this file have access to a helper object that includes
# the PageHelper. For example:
#
# describe PageHelper do
#   describe "string concat" do
#     it "concats two strings with spaces" do
#       expect(helper.concat_strings("this","that")).to eq("this that")
#     end
#   end
# end
RSpec.describe PagesHelper, type: :helper do
  describe 'hero_text' do
    subject { helper.hero_text(current_country) }

    context 'when current_country is nil' do
      let(:current_country) { nil }
      let(:expected_text) { "<h1>Blue Forests</h1><h2>Measuring Carbon Stocks Worldwide</h2>" }

      it { is_expected.to eq expected_text }
    end

    context 'when current_country is set' do
      let(:current_country) { FactoryGirl.build(:country, name: 'mozambique') }
      let(:expected_text) { "<h1>Blue Forests</h1><h2>Measuring Carbon Stocks in Mozambique</h2>" }

      it { is_expected.to eq expected_text }
    end
  end
end
