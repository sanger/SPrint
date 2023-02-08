package uk.ac.sanger.sprint.utils;

import java.util.Collections;
import java.util.List;

/**
 * @author dr6
 */
public class BasicUtils {
    /**
     * Returns a string representation of the given object.
     * If it is a string it will be in quote marks and unprintable
     * characters will be shown as unicode insertions.
     * @param o object to represent
     * @return a string
     */
    public static String repr(Object o) {
        if (o==null) {
            return "null";
        }
        if (o instanceof CharSequence) {
            return StringRepr.repr((CharSequence) o);
        }
        if (o instanceof Character) {
            return StringRepr.repr((char) o);
        }
        return o.toString();
    }

    public static <E> List<E> nullToEmpty(List<E> list) {
        return (list==null ? Collections.emptyList() : list);
    }

    public static String nullToEmpty(String string) {
        return (string==null ? "" : string);
    }
}
