package uk.ac.sanger.sprint.model;

import com.google.common.base.MoreObjects;

import java.nio.file.Path;
import java.util.Objects;

/**
 * A printer we can send a print request to
 */
public class Printer {
    private String hostname;
    private LabelType labelType;
    private PrinterType printerType;
    private Path path;

    /**
     * Constructs a new printer with default values for every field
     */
    public Printer() {}

    /**
     * Constructs a new printer initialised with the given field values
     * @param hostname the hostname of the printer
     * @param printerType the type of printer
     * @param labelType the type of label supported by the printer
     * @param path the file path for this printer
     */
    public Printer(String hostname, PrinterType printerType, LabelType labelType, Path path) {
        this.hostname = hostname;
        this.printerType = printerType;
        this.labelType = labelType;
        this.path = path;
    }

    /**
     * Gets the hostname of the printer
     * @return the hostname
     */
    public String getHostname() {
        return hostname;
    }

    /**
     * Sets the hostname of the printer
     * @param hostname the new hostname
     */
    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    /**
     * Gets the printer type of the printer
     * @return the printer type
     */
    public PrinterType getPrinterType() {
        return printerType;
    }

    /**
     * Sets the printer type of the printer
     * @param printerType the new printer type
     */
    public void setPrinterType(PrinterType printerType) {
        this.printerType = printerType;
    }

    /**
     * Gets the label type supported by the printer
     * @return the label type
     */
    public LabelType getLabelType() {
        return labelType;
    }

    /**
     * Sets the label type for the printer
     * @param labelType the new label type
     */
    public void setLabelType(LabelType labelType) {
        this.labelType = labelType;
    }

    public String getAddress() {
        return (hostname.indexOf('.') < 0) ? hostname + ".internal.sanger.ac.uk" : hostname;
    }

    public Path getPath() {
        return this.path;
    }

    public void setPath(Path path) {
        this.path = path;
    }

    @Override
    public String toString() {
        return MoreObjects.toStringHelper(this)
                .add("hostname", hostname)
                .add("labelType", labelType)
                .add("printerType", printerType)
                .add("path", path)
                .toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Printer that = (Printer) o;
        return (Objects.equals(this.hostname, that.hostname)
                && Objects.equals(this.labelType, that.labelType)
                && Objects.equals(this.printerType, that.printerType)
                && Objects.equals(this.path, that.path));
    }

    @Override
    public int hashCode() {
        return (hostname==null ? 0 : hostname.hashCode());
    }
}
