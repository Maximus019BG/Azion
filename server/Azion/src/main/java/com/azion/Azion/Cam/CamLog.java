package com.azion.Azion.Cam;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table
public class CamLog {

    @Id
    private String id;

    @OneToOne
    private Cam camID;

    @Lob
    @Column(name = "log", columnDefinition = "LONGBLOB")
    private byte[] log;

    @PrePersist
    public void prePersist() {
        generateId();
    }

    public void generateId() {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        this.id = uuid.substring(0, Math.min(uuid.length(), 50)) + System.currentTimeMillis();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Cam getCamID() {
        return camID;
    }

    public void setCamID(Cam camID) {
        this.camID = camID;
    }

    public byte[] getLog() {
        return log;
    }

    public void setLog(byte[] log) {
        this.log = log;
    }

    public void addLog(String logEntry) {
        if (this.log == null) {
            this.log = logEntry.getBytes();
        } else {
            byte[] newLog = new byte[this.log.length + logEntry.getBytes().length];
            System.arraycopy(this.log, 0, newLog, 0, this.log.length);
            System.arraycopy(logEntry.getBytes(), 0, newLog, this.log.length, logEntry.getBytes().length);
            this.log = newLog;
        }
    }

    public void updateLog(String logEntry) {
        addLog(logEntry);
    }
}