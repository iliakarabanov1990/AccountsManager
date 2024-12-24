@IsTest
private with sharing class AccountServiceControllerHelperTest {

    @isTest 
    public static void testOpperateResponse() {
        // или может предполагалось что я откопаю метод типа Test.createStubQueryRows?
        AccountServiceControllerHelper mockAccService = 
            (AccountServiceControllerHelper)Test.createStub(AccountServiceControllerHelper.class, new MockProvider(new Map<String, Object> {'rightRequast'=> true}));
        AccountServiceControllerHelper accService = new AccountServiceControllerHelper();

        HttpResponse response = mockAccService.sendRequastToAccountService('GET', new Map<String, String>(), '');

        Assert.areEqual('001Qy00000hiSStIAM', ((List<Account>)accService.opperateResponse(response).get('body'))[0].get('Id'), 'Wrong opperatinon right requast in AccountServiceControllerHelper');
    }

    @isTest 
    public static void testNegativeOpperateResponse() {
          
        AccountServiceControllerHelper mockAccService = 
            (AccountServiceControllerHelper)Test.createStub(AccountServiceControllerHelper.class, new MockProvider(new Map<String, Object> {'rightRequast'=> false}));
        AccountServiceControllerHelper accService = new AccountServiceControllerHelper();

        HttpResponse response = mockAccService.sendRequastToAccountService('GET', new Map<String, String>(), '');

        Assert.areEqual('bad request!', accService.opperateResponse(response).get('body'), 'Wrong opperatinon bad requast in AccountServiceControllerHelper');
    }
}