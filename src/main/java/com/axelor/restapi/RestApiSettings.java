package com.axelor.restapi;

import com.axelor.common.ResourceUtils;
import com.axelor.common.StringUtils;
import java.io.FileInputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

public class RestApiSettings {
  private static final String DEFAULT_CONFIG_LOCATION = "rest-api.properties";

  private Properties properties;

  private static RestApiSettings instance;

  private RestApiSettings() {
    String config = System.getProperty("axelor.config");
    InputStream stream = null;
    try {
      if (StringUtils.isBlank(config)) {
        stream = ResourceUtils.getResourceStream(config = DEFAULT_CONFIG_LOCATION);
      } else {
        stream = new FileInputStream(config);
      }
      try {
        properties = new RestApiSettings.LinkedProperties();
        properties.load(stream);
      } finally {
        stream.close();
      }
    } catch (Exception e) {
      throw new RuntimeException("Unable to load rest-api settings: " + config);
    }
  }

  public static RestApiSettings get() {
    if (instance == null) {
      instance = new RestApiSettings();
    }
    return instance;
  }

  public String get(String key) {
    return sub(properties.getProperty(key));
  }

  private String sub(String value) {
    if (value == null) {
      return null;
    }
    final LocalDate now = LocalDate.now();
    return value
        .replace("{year}", "" + now.getYear())
        .replace("{month}", "" + now.getMonthValue())
        .replace("{day}", "" + now.getDayOfMonth())
        .replace("{java.io.tmpdir}", System.getProperty("java.io.tmpdir"))
        .replace("{user.home}", System.getProperty("user.home"));
  }

  /** Properties with keys in order of insertion */
  public static class LinkedProperties extends Properties {

    private static final long serialVersionUID = -1869328576799427860L;
    private final Set<Object> keys = new LinkedHashSet<>();

    @Override
    public synchronized Object put(Object key, Object value) {
      keys.add(key);
      return super.put(key, value);
    }

    @Override
    public synchronized void putAll(Map<? extends Object, ? extends Object> t) {
      keys.addAll(t.keySet());
      super.putAll(t);
    }

    @Override
    public synchronized Object remove(Object key) {
      keys.remove(key);
      return super.remove(key);
    }

    @Override
    public synchronized boolean remove(Object key, Object value) {
      keys.remove(key);
      return super.remove(key, value);
    }

    @Override
    public Set<Object> keySet() {
      return Collections.unmodifiableSet(keys);
    }

    @Override
    public Set<String> stringPropertyNames() {
      return keys.stream()
          .map(Object::toString)
          .collect(Collectors.toCollection(LinkedHashSet::new));
    }
  }
}
