require 'rails_helper'

describe Mbtile do
  describe ".already_generated?" do
    before(:example) do
      allow(CartoDb::Validation).to receive(:create)
    end

    let(:area) { FactoryGirl.create(:area) }

    let(:mbtile) {
      FactoryGirl.create(:mbtile,
        last_generation_started_at: Time.now,
        area: area)
    }

    subject { mbtile.already_generated? }

    describe "given an area with old validations" do
      let!(:validation) {
        Timecop.travel(Date.today - 5) do
          FactoryGirl.create(:validation, area: area)
        end
      }

      it "returns true" do
        expect(subject).to eq(true)
      end
    end

    describe "given an area with new validations" do
      let!(:validation) {
        Timecop.travel(Date.today + 5) do
          FactoryGirl.create(:validation, area: area)
        end
      }

      it "returns false" do
        expect(subject).to eq(false)
      end
    end

    describe "given an area with no validations" do
      it "returns false" do
        expect(subject).to eq(false)
      end
    end
  end
end
