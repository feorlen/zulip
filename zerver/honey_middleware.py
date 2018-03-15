from django.utils.deprecation import MiddlewareMixin
import libhoney
import os
import time

class HoneyMiddleware(MiddlewareMixin):
  def __init__(self, get_response=None):
    self.builder = libhoney.Builder()
    #self.builder.writekey = os.environ["WRITEKEY"]
    self.builder.dataset = "django-requests"
    
    super(HoneyMiddleware, self).__init__(get_response)
    
  def process_request(self, request):
    request.start_time = time.time()
    return None
  
  def process_response(self, request, response):
    response_time = time.time() - request.start_time
      
    self.builder.send_now({
      "method": request.method,
      "scheme": request.scheme,
      "path": request.path,
      "query": request.GET,
      "isSecure": request.is_secure(),
      "isAjax": request.is_ajax(),
      "isUserAuthenticated": request.user.is_authenticated(),
      #"username": request.user.username,
      "email": request.user.email,
      "host": request.get_host(),
      "ip": request.META['REMOTE_ADDR'],
      "responseTime_ms": response_time * 1000,
    })
      
    return response
    
