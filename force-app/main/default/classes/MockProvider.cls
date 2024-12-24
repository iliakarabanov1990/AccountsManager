@isTest
public with sharing class MockProvider implements System.StubProvider {
    
    Map<String, Object> params;

    public MockProvider(Map<String, Object> params){
        this.params = params;
    }

    public Object handleMethodCall(Object stubbedObject, String stubbedMethodName, 
            Type returnType, List<Type> listOfParamTypes, List<String> listOfParamNames, List<Object> listOfArgs) {

        if (stubbedMethodName == 'sendRequastToAccountService') {

            Boolean rightRequast = (Boolean)params.get('rightRequast');
            HttpResponse response = new HttpResponse();
            Integer status = rightRequast ? 200 : 400;
            String body = rightRequast ? '[{"Id": "001Qy00000hiSStIAM"}, {"Id": "001Qy00000hiSStIAF"}]' : 'bad request!';
            response.setStatusCode(status);
            response.setBody(body);

            return response;

        } else { return null; }
    }
}