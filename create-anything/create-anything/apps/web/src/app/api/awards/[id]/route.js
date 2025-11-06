import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const [award] = await sql`
      SELECT * FROM awards WHERE id = ${id} AND deleted_at IS NULL
    `;

    if (!award) {
      return Response.json({ error: "Award not found" }, { status: 404 });
    }

    return Response.json(award);
  } catch (error) {
    console.error("Error fetching award:", error);
    return Response.json({ error: "Failed to fetch award" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      title,
      description,
      location,
      event_date,
      image,
      status,
    } = body;

    // Validate required fields
    if (!title || !location || !event_date) {
      return Response.json(
        { error: "Title, location, and event date are required" },
        { status: 400 },
      );
    }

    // Update award
    const [updatedAward] = await sql`
      UPDATE awards
      SET
        title = ${title},
        description = ${description || null},
        location = ${location},
        event_date = ${event_date},
        image = ${image || null},
        status = ${status || 'upcoming'}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updatedAward) {
      return Response.json({ error: "Award not found" }, { status: 404 });
    }

    return Response.json(updatedAward);
  } catch (error) {
    console.error("Error updating award:", error);
    return Response.json(
      { error: "Failed to update award" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Soft delete award
    const [deletedAward] = await sql`
      UPDATE awards
      SET deleted_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!deletedAward) {
      return Response.json({ error: "Award not found" }, { status: 404 });
    }

    return Response.json({ message: "Award deleted successfully" });
  } catch (error) {
    console.error("Error deleting award:", error);
    return Response.json(
      { error: "Failed to delete award" },
      { status: 500 },
    );
  }
}
