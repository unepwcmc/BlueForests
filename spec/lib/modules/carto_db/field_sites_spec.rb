require 'rails_helper'

RSpec.describe CartoDb::FieldSites do
  describe '.import' do
    context 'when source tables do not exist' do
      before do
        allow(described_class).to receive(:source_tables_exist?).and_return(false)
      end

      it 'returns false' do
        expect(described_class.import).to eq(false)
      end

      it 'logs correct error' do
        expect(Rails.logger).to receive(:info).with(described_class::ERROR_MESSAGES[:sources])
        described_class.import
      end
    end

    context 'when main table already exists' do
      before do
        allow(described_class).to receive(:source_tables_exist?).and_return(true)
        allow(described_class).to receive(:table_exists?).and_return(true)
      end

      it 'returns false' do
        expect(described_class.import).to eq(false)
      end

      it 'logs correct error' do
        expect(Rails.logger).to receive(:info).with(described_class::ERROR_MESSAGES[:table_exists])
        described_class.import
      end
    end

    context 'when all queries succeed' do
      before do
        allow(described_class).to receive(:source_tables_exist?).and_return(true)
        allow(described_class).to receive(:table_exists?).and_return(false)
      end

      it 'calls create_table method' do
        expect(described_class).to receive(:create_table)
        described_class.import
      end

      context 'when create table succedes' do
        it 'returns true' do
          allow(described_class).to receive(:create_table).and_return(true)
          expect(described_class.import).to eq(true)
        end
      end

      context 'when create table fails' do
        it 'returns false' do
          allow(described_class).to receive(:create_table).and_return(false)
          expect(described_class.import).to eq(false)
        end
      end
    end
  end

  describe '.drop_table' do
    it 'runs a query to drop the main table' do
      expect(CartoDb).to receive(:query).with("DROP TABLE #{described_class::TABLE_NAME}")
      described_class.drop_table
    end
  end

  describe '.copy_data' do
    let(:madagascar) { FactoryGirl.create(:country, name: 'madagascar', subdomain: 'madagascar', iso: 'MG') }
    let(:indonesia) { FactoryGirl.create(:country, name: 'indonesia', subdomain: 'indonesia', iso: 'ID') }

    let(:countries) { [madagascar, indonesia] }

    before do
      allow(described_class).to receive(:countries_used).and_return(countries)
    end

    it 'runs query to copy data from source tables to main table' do
      expect(CartoDb).to receive(:query).with(
        <<-SQL
          INSERT INTO blueforests_field_sites_2020_test(the_geom, name, country_id)
          SELECT the_geom, COALESCE(name, #{described_class::DUMMY_NAME} || 'MG'), 'MG' AS country_id
          FROM madagascar_study_sites
        SQL
      ).and_return({})
      expect(CartoDb).to receive(:query).with(
        <<-SQL
          INSERT INTO blueforests_field_sites_2020_test(the_geom, name, country_id)
          SELECT the_geom, COALESCE(name, #{described_class::DUMMY_NAME} || 'ID'), 'ID' AS country_id
          FROM indonesia_study_sites
        SQL
      ).and_return({})

      described_class.send(:copy_data)
    end

    context 'when no errors' do
      before do
        allow(CartoDb).to receive(:query).and_return({'rows' => []})
      end

      it 'returns true' do
        expect(described_class.send(:copy_data)).to eq(true)
      end
    end

    context 'when copying from one of the source tables fails' do
      before do
        allow(CartoDb).to receive(:query).and_return({'error' => 'error_message'})
      end

      it 'returns false' do
        expect(described_class.send(:copy_data)).to eq(false)
      end

      it 'logs error' do
        expect(Rails.logger).to receive(:info).with('error_message')

        described_class.send(:copy_data)
      end
    end
  end
end
