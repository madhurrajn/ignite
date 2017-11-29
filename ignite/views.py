from django.shortcuts import render
from django.template import RequestContext, loader
from django.http import HttpResponse
from django.http import JsonResponse
from ignite import  Scheduler
import json
from django.views.decorators.csrf import ensure_csrf_cookie
import pandas as pd
import os
from mysite.settings import BASE_DIR


def get_data_frame():
    try:
        print "Reading CSV"
        file_path = os.path.join(BASE_DIR, './ignite/db/')
        df =  pd.read_csv(file_path+"MASKED_HR_SIEBEL_CASE_DATA_FY14-16_CSV.csv", encoding = "ISO-8859-1", low_memory=False);
        return df
    except Exception as e:
        print "Unable to read csv {}".format(e)

def fetch_graph_data(data):
    print "fetching graph details"
    siebel_frame_concat = get_data_frame()
    features = data.split(",")
    features = [x for x in features if x]
    features.append('Case Created Date')
    top5_subareas=['Terminations','Forms/Documents', 
                           'PTO/Time Off-Policy', 'Payroll  Tools', 'Finance']
    case_sub_area_data = siebel_frame_concat[features].copy()
    case_sub_area_data['Date']=pd.to_datetime(case_sub_area_data[u'Case Created Date'])
    case_sub_area_data['Year']=case_sub_area_data['Date'].dt.year
    case_sub_area_data['Month']=case_sub_area_data['Date'].dt.month
    case_sub_area_data['Week']=case_sub_area_data['Date'].dt.week
    case_sub_area_data['Day']=case_sub_area_data['Date'].dt.day
    case_sub_area_data['Date']=case_sub_area_data['Date'].dt.date
    features = []
    features.append("Year")
    features.append("Week")
    #features.remove('Case Created Date')
    t = pd.DataFrame({'count' : case_sub_area_data.groupby(features).size()}).reset_index()
    years_to_consider = ['2013', '2014', '2015', '2016']
    temp = {}
    for year in years_to_consider:
        temp[year] = t.query("Year == "+year).to_json(orient='records')
    return temp
    

def fetch_headers(data):
    print "calling fetch_headers"
    df = get_data_frame()
    print str(df.columns.values)
    arr = pd.Series(df.columns.values)
    dropdown = []
    for ind, elem in enumerate(arr):
        d = {}
        d['id'] = ind;
        print ind, elem
        d['label'] = elem
        dropdown.append(d)
    #dropdown.to_json(orient='values')
    return dropdown


def handlePostMethod(request):
    print "Inside post method"
    print request.body
    function = request.POST.get("function")
    data = request.POST.get("data")
    print "Function {}".format(function)
    print "Data {}".format(data)
    return eval(function)(data)


def json_schedule_list(list):
    json_list = []
    d = {}
    d['list'] = list
    json_list.append(d)
    return json_list

@ensure_csrf_cookie
def index(request):
    if request.method == 'POST':
        try:
            json_list = handlePostMethod(request)
            #json_list = json_schedule_list(list)
            #print json_list
            return JsonResponse({'sched_list':json_list})
        except Exception as e:
            print e
    else:
        template = loader.get_template('ignite/index.html')
        context = RequestContext(request)
        return HttpResponse(template.render(context))

def empty(request):
    return HttpResponse('')


# Create your views here.
