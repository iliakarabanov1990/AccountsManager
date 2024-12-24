public with sharing class AccountServiceControllerHelper {
      
    public HttpResponse sendRequastToAccountService(String method, Map<String, String> paramsMap, String body){

        HttpRequest request = new HttpRequest();
        String params = '';
        
        if(!String.isBlank(body)) { request.setBody(body); }
                        
        for(String key : paramsMap.keySet()) { params += key + '=' + paramsMap.get(key) + '&'; }
        if(paramsMap.size() > 0) { params = '?' + params.left(params.length() - 1); }              

        request.setEndpoint('callout:AS/services/apexrest/Accounts' + params);  
        request.setHeader('Content-type','application/json; charset=UTF-8');
     	request.setHeader('Accept', 'application/json');
        request.setMethod(method);

        return new Http().send(request);
    }

    public Map<String, Object> opperateResponse(HttpResponse response) {
        Map<String, Object> result = new Map<String, Object>{'status'=>'', 'body'=>''};
        result.put('status', response.getStatusCode().toString());

        if(result.get('status') == '200') { result.put('body', (List<Account>)JSON.deserialize((String)response.getBody(), List<Account>.class)); } 
        else { result.put('body', response.getBody()); }
        
		return result;
    }
}