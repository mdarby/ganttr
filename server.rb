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

  {
    :boxes => [
      {:start_date => "Nov 3, 2009", :end_date => "Nov 12, 2009", :label => "ASDF", :resource => "MD"},
      {:start_date => "Nov 5, 2009", :end_date => "Nov 17, 2009", :label => "Working?", :resource => "GM"},
      {:start_date => "Nov 15, 2009", :end_date => "Nov 23, 2009", :label => "Whoa...", :resource => "TM"},
      {:start_date => "Nov 17, 2009", :end_date => "Nov 25, 2009", :label => "Hrm", :resource => "GG"},
      {:start_date => "Nov 17, 2009", :end_date => "Dec 5, 2009", :label => "Long!", :resource => "KJ"},
      {:start_date => "Dec 1, 2009", :end_date => "Dec 14, 2009", :label => "Oh yes!", :resource => "KH"},
      {:start_date => "Dec 3, 2009", :end_date => "Dec 9, 2009", :label => "Something", :resource => "LS"},
      {:start_date => "Dec 3, 2009", :end_date => "Dec 12, 2009", :label => "Same Day", :resource => "SS"},
      {:start_date => "Dec 4, 2009", :end_date => "Dec 15, 2009", :label => "Next Day", :resource => "GD"},
      {:start_date => "Dec 7, 2009", :end_date => "Dec 9, 2009", :label => "Smaller", :resource => "MQ"}
    ],
    :arrows => [
      {:from => 0, :to => [1,2]},
      {:from => 1, :to => 2},
      {:from => 3, :to => [5,6]},
      {:from => 6, :to => 7}
    ]
  }.to_json
end

get '/stylesheet.css' do
  content_type 'text/css', :charset => 'utf-8'
  sass :stylesheet
end