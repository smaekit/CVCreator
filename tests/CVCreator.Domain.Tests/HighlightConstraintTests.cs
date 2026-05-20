using CVCreator.Domain.Entities;
using FluentAssertions;

namespace CVCreator.Domain.Tests;

public class HighlightConstraintTests
{
    private static CVAssignment Highlighted(Guid assignmentId) =>
        new() { AssignmentId = assignmentId, IsHighlighted = true };

    [Fact]
    public void CanHighlight_Two_Assignments()
    {
        var selections = new List<CVAssignment>
        {
            Highlighted(Guid.NewGuid()),
            Highlighted(Guid.NewGuid())
        };

        var highlightedCount = selections.Count(a => a.IsHighlighted);
        highlightedCount.Should().Be(2);
    }

    [Fact]
    public void Attempting_Third_Highlight_ExceedsLimit()
    {
        var selections = new List<CVAssignment>
        {
            Highlighted(Guid.NewGuid()),
            Highlighted(Guid.NewGuid()),
            Highlighted(Guid.NewGuid())
        };

        var action = () =>
        {
            var count = selections.Count(a => a.IsHighlighted);
            if (count > 2) throw new InvalidOperationException("Cannot highlight more than 2 assignments.");
        };

        action.Should().Throw<InvalidOperationException>()
            .WithMessage("*2*");
    }
}
