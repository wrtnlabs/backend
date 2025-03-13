import { IHubChannelCategory } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannelCategory";

export namespace HubChannelCategoryDiagnoser {
  export const detail =
    (map: Map<string, IHubChannelCategory.IHierarchical>) =>
    (input: IHubChannelCategory.IHierarchical): IHubChannelCategory => {
      const assigner = (
        category: IHubChannelCategory.IHierarchical,
      ): IHubChannelCategory => ({
        id: category.id,
        parent_id: category.parent_id,
        name: category.name,
        created_at: category.created_at,
        background_image_url: category.background_image_url,
        background_color: category.background_color,
        parent: null,
        children: category.children,
      });

      const output: IHubChannelCategory = assigner(input);
      // eslint-disable-next-line
      let current: IHubChannelCategory.IInvert = output;

      while (input.parent_id !== null) {
        const parent: IHubChannelCategory.IHierarchical | undefined = map.get(
          input.parent_id,
        );
        if (parent === undefined)
          throw new Error(
            `Error on HubChannelCategoryDiagnoser.invert(): unable to find the matched category - (id: "${input.parent_id}").`,
          );
        current.parent = assigner(parent);
        current = current.parent;
        input = parent;
      }
      return output;
    };

  export const associate =
    (map: Map<string, IHubChannelCategory.IHierarchical>) =>
    (categories: IHubChannelCategory.IHierarchical[]): void =>
      categories.forEach((category) => {
        map.set(category.id, category);
        associate(map)(category.children);
      });
}
