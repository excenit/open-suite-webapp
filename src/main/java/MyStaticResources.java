import com.axelor.web.StaticResourceProvider;
import java.util.List;

public class MyStaticResources implements StaticResourceProvider {
  @Override
  public void register(List<String> resources) {
    resources.add("js/excenit.js");
  }
}
