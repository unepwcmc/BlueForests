require 'rails_helper'

describe Validation do
  describe ".most_recent_id_by_habitat" do
    let(:user1) { FactoryGirl.create(:user) }
    let(:user2) { FactoryGirl.create(:user) }
    let(:user3) { FactoryGirl.create(:user) }

    before(:each) do
      allow(CartoDb::Validation).to receive(:create)
      allow(CartoDb::Validation).to receive(:edit)

      @val_seagrass = FactoryGirl.create(:validation, user: user1, habitat: 'seagrass')
      @val_mangrove = FactoryGirl.create(:validation, user: user2, habitat: 'mangrove')
      @val_mangrove_outside_relation = FactoryGirl.create(:validation, user: user3, habitat: 'mangrove')
    end

    context 'given no arguments' do
      subject { Validation.most_recent_id_by_habitat }
      it { is_expected.to eq({'mangrove' => @val_mangrove_outside_relation.id, 'seagrass' => @val_seagrass.id}) }
    end

    context 'given a relation as argument' do
      let(:relation) { Validation.where(user_id: [user1.id, user2.id]) }
      subject { Validation.most_recent_id_by_habitat(relation) }

      it { is_expected.to eq({'mangrove' => @val_mangrove.id, 'seagrass' => @val_seagrass.id}) }
    end
  end
end

