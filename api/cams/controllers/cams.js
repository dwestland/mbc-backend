"use strict";
const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  // Create cam with linked user
  async create(ctx) {
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      data.user = ctx.state.user.id;
      entity = await strapi.services.cams.create(data, { files });
    } else {
      ctx.request.body.user = ctx.state.user.id;
      entity = await strapi.services.cams.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.cams });
  },
  // Update user cam
  async update(ctx) {
    const { id } = ctx.params;

    let entity;

    const [cams] = await strapi.services.cams.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });

    if (!cams) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.cams.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.cams.update({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.cams });
  },
  // Delete a user cam
  async delete(ctx) {
    const { id } = ctx.params;

    const [cams] = await strapi.services.cams.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });

    if (!cams) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    const entity = await strapi.services.cams.delete({ id });
    return sanitizeEntity(entity, { model: strapi.models.cams });
  },

  // Get logged in users
  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    const data = await strapi.services.cams.find({ user: user.id });

    if (!data) {
      return ctx.notFound();
    }

    return sanitizeEntity(data, { model: strapi.models.cams });
  },
};
