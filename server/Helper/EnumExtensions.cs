using System.ComponentModel.DataAnnotations;

public static class EnumExtensions
{
    public static string GetDisplayName(this Enum enumValue)
    {
        var field = enumValue.GetType().GetField(enumValue.ToString());
        var attribute = field?.GetCustomAttributes(typeof(DisplayAttribute), false)
                             .FirstOrDefault() as DisplayAttribute;
        return attribute?.Name ?? enumValue.ToString();
    }
}
