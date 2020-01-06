# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150717151226) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "postgis"

  create_table "areas", force: :cascade do |t|
    t.string   "title"
    t.text     "coordinates"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "country_id"
  end

  create_table "assignments", force: :cascade do |t|
    t.integer  "user_id"
    t.integer  "role_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "countries", force: :cascade do |t|
    t.string   "name"
    t.string   "subdomain"
    t.string   "iso"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "bounds",     default: [], array: true
  end

  create_table "geometries", force: :cascade do |t|
    t.geometry "the_geom",             limit: {:srid=>0, :type=>"geometry"}
    t.string   "action"
    t.integer  "user_id"
    t.integer  "age"
    t.integer  "area_id"
    t.integer  "density"
    t.string   "knowledge"
    t.text     "notes"
    t.string   "author"
    t.boolean  "display"
    t.integer  "phase",                limit: 8
    t.integer  "phase_id",             limit: 8
    t.integer  "prev_phase",           limit: 8
    t.integer  "edit_phase",           limit: 8
    t.boolean  "toggle"
    t.float    "value"
    t.integer  "condition"
    t.text     "habitat"
    t.geometry "the_geom_webmercator", limit: {:srid=>0, :type=>"geometry"}
    t.geometry "carbon_view",          limit: {:srid=>0, :type=>"geometry"}
    t.string   "country_id"
  end

  create_table "mbtiles", force: :cascade do |t|
    t.string   "status",                     default: "pending"
    t.datetime "last_generation_started_at"
    t.datetime "last_generated_at"
    t.string   "habitat"
    t.integer  "area_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "photos", force: :cascade do |t|
    t.string   "attachment_file_name"
    t.string   "attachment_content_type"
    t.integer  "attachment_file_size"
    t.datetime "attachment_updated_at"
    t.integer  "validation_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "roles", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "description"
  end

  create_table "users", force: :cascade do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.string   "authentication_token"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "users", ["authentication_token"], name: "index_users_on_authentication_token", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  create_table "users_countries", force: :cascade do |t|
    t.integer "country_id"
    t.integer "user_id"
  end

  add_index "users_countries", ["user_id", "country_id"], name: "index_users_countries_on_user_id_and_country_id", unique: true, using: :btree

  create_table "validations", force: :cascade do |t|
    t.text     "coordinates"
    t.string   "action"
    t.datetime "recorded_at"
    t.integer  "area_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "habitat"
    t.string   "knowledge"
    t.float    "density"
    t.float    "age"
    t.text     "notes"
    t.integer  "condition"
    t.string   "species"
    t.integer  "country_id"
  end

end
