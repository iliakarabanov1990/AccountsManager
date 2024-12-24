public with sharing class AccountServiceController {
    //вынес в отдельные класс-хелпер (из-за ограничения использования static methods в Stub) и разделил на методы (у меня был всего один метод, а идея Stub подменить результат какого-нить метода статическими данными),
    //по-другому использование Stub не представлялось хоть сколько-нибудь имеющим смысл, поэтому столько ненужной инкапсуляции
    //подходило идеально Mock (но требование в ТЗ Stub)
    @AuraEnabled
    public static Map<String, Object> sendRequast(String method, Map<String, String> paramsMap, String body) {        
        AccountServiceControllerHelper helper = new AccountServiceControllerHelper();
        HttpResponse response = helper.sendRequastToAccountService(method, paramsMap, body);      
		return helper.opperateResponse(response);
    }
}