package demo;

public class ExampleRepository {
    private static final String FIND_ACTIVE = "SELECT ID, NAME FROM CUSTOMER WHERE STATUS = 'A' FETCH FIRST 10 ROWS ONLY";
    private static final String FIND_USER =
        "SELECT " +
        " A.USER_ID " +
        " FROM USER A " +
        " WHERE A.STATUS = ?";
}
