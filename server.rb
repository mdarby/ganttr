require 'rubygems'
require 'sinatra'
require 'haml'
require 'sass'
require 'json'

get '/' do
  haml :index
end

get '/json' do
  content_type :json

  [
    {:start_date => "Nov 3, 2009", :end_date => "Nov 12, 2009", :task => "ASDF", :resource => "MD"},
    {:start_date => "Nov 5, 2009", :end_date => "Nov 17, 2009", :task => "Working?", :resource => "GM"},
    {:start_date => "Nov 15, 2009", :end_date => "Nov 23, 2009", :task => "Whoa...", :resource => "TM"},
    {:start_date => "Nov 17, 2009", :end_date => "Nov 25, 2009", :task => "Hrm", :resource => "GG"},
    {:start_date => "Nov 17, 2009", :end_date => "Dec 5, 2009", :task => "Long!", :resource => "KJ"},
    {:start_date => "Dec 1, 2009", :end_date => "Dec 14, 2009", :task => "Oh yes!", :resource => "KH"},
    {:start_date => "Dec 3, 2009", :end_date => "Dec 9, 2009", :task => "Something", :resource => "LS"},
    {:start_date => "Dec 3, 2009", :end_date => "Dec 12, 2009", :task => "Same Day", :resource => "SS"},
    {:start_date => "Dec 4, 2009", :end_date => "Dec 15, 2009", :task => "Next Day", :resource => "GD"}
  ].to_json
end

get '/stylesheet.css' do
  content_type 'text/css', :charset => 'utf-8'
  sass :stylesheet
end