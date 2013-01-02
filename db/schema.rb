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
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20121220110332) do

  create_table "admins", :force => true do |t|
    t.string   "email",                  :default => "", :null => false
    t.string   "encrypted_password",     :default => "", :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.string   "authentication_token"
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
  end

  add_index "admins", ["authentication_token"], :name => "index_admins_on_authentication_token", :unique => true
  add_index "admins", ["email"], :name => "index_admins_on_email", :unique => true
  add_index "admins", ["reset_password_token"], :name => "index_admins_on_reset_password_token", :unique => true

  create_table "areas", :force => true do |t|
    t.string   "title"
    t.string   "coordinates"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "assignments", :force => true do |t|
    t.integer  "admin_id"
    t.integer  "role_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "delayed_jobs", :force => true do |t|
    t.integer  "priority",   :default => 0
    t.integer  "attempts",   :default => 0
    t.text     "handler"
    t.text     "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string   "locked_by"
    t.string   "queue"
    t.datetime "created_at",                :null => false
    t.datetime "updated_at",                :null => false
  end

  add_index "delayed_jobs", ["priority", "run_at"], :name => "delayed_jobs_priority"

  create_table "geometries", :force => true do |t|
    t.string  "action"
    t.integer "admin_id"
    t.integer "age"
    t.integer "area_id"
    t.integer "density"
    t.string  "knowledge"
    t.text    "notes"
    t.string  "author"
    t.boolean "display"
    t.integer "phase",      :limit => 8
    t.integer "phase_id",   :limit => 8
    t.integer "prev_phase", :limit => 8
    t.boolean "toggle"
    t.float   "value"
    t.spatial "the_geom",   :limit => {:srid=>0, :type=>"geometry"}
  end

  create_table "mbtiles", :force => true do |t|
    t.string   "status",                     :default => "pending"
    t.datetime "last_generation_started_at"
    t.datetime "last_generated_at"
    t.string   "habitat"
    t.integer  "area_id"
    t.datetime "created_at",                                        :null => false
    t.datetime "updated_at",                                        :null => false
  end

  create_table "roles", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "validations", :force => true do |t|
    t.text     "coordinates"
    t.string   "action"
    t.datetime "recorded_at"
    t.integer  "area_id"
    t.integer  "admin_id"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
    t.string   "habitat"
    t.string   "knowledge"
    t.float    "density"
    t.float    "age"
    t.text     "notes"
    t.integer  "condition"
    t.string   "species"
  end

end
