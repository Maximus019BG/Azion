package com.azion.Azion.Meetings.Util;

import com.azion.Azion.Meetings.Enum.EnumDays;
import lombok.experimental.UtilityClass;

@UtilityClass
public class MeetingUtil {
    //!Day string to Enum
    public Enum<EnumDays> dayToEnum(String day) {
        switch (day.toUpperCase()) {
            case "MONDAY":
                return EnumDays.MONDAY;
            case "TUESDAY":
                return EnumDays.TUESDAY;
            case "WEDNESDAY":
                return EnumDays.WEDNESDAY;
            case "THURSDAY":
                return EnumDays.THURSDAY;
            case "FRIDAY":
                return EnumDays.FRIDAY;
            case "SATURDAY":
                return EnumDays.SATURDAY;
            case "SUNDAY":
                return EnumDays.SUNDAY;
            default:
                throw new IllegalArgumentException("Invalid day: " + day);
        }
    }
}
