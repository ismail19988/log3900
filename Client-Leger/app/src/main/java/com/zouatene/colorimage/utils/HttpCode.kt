package com.zouatene.colorimage.utils

object HttpCode {
    const val EMAIL_ALREADY_EXISTS = 601;
    const val USERNAME_ALREADY_EXISTS = 602;
    const val USER_ALREADY_CONNECTED = 603;
    const val DATABASE_ERROR = 604;
    const val JWT_ERROR = 605;
    const val USER_NOT_CONNECTED = 606;

    const val AUTHORIZED = 200;

    const val EMAIL_NOT_PROVIDED = 701;
    const val PASSWORD_NOT_PROVIDED = 702;
    const val FIRSTNAME_NOT_PROVIDED = 703;
    const val LASTNAME_NOT_PROVIDED = 704;
    const val ROOM_NAME_NOT_PROVIDED = 705;
    const val USERNAME_NOT_PROVIDED = 706;

    const val USER_ALREADY_IN_ROOM = 707;
    const val ROOM_DOESNT_EXIST = 708;
    const val USER_NOT_LOGGED_IN = 709;
    const val USER_NOT_IN_ROOM = 710;
    const val ROOM_ALREADY_EXISTS = 711;
    const val ONLY_OWNER_CAN_DELETE = 712;
    const val DRAWING_USER_LIMIT_REACHED = 718;

    const val EMAIL_NOT_FOUND = 901;
    const val WRONG_PASSWORD = 902;
}